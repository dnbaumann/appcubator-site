from django.http import HttpResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
import json
from django.shortcuts import redirect, render, render_to_response, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib.auth.models import User
from models import App, StaticFile, UITheme, ApiKeyUses, ApiKeyCounts, AppstateSnapshot, LogAnything, Customer, ExtraUserData
from django.db.models import Avg, Count
from email.sendgrid_email import send_email
from models import DomainRegistration
from models import get_default_uie_state, get_default_mobile_uie_state
from models import get_default_app_state, get_default_theme_state

import requests
import traceback
import datetime
import shlex
import subprocess
import os
from datetime import datetime, timedelta
import time
from django.utils import timezone
from django.core.serializers.json import DjangoJSONEncoder

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_home(request):
    page_context = {}
    now = datetime.utcnow()
    now = int(time.mktime(now.timetuple()))
    beginning = datetime(year=2013, month=6, day=26)
    beginning = int(time.mktime(beginning.timetuple()))

    # active users
    page_context["users_today"] = recent_users(long_ago=timedelta(days=1))
    page_context["users_last_week"] = recent_users(long_ago=timedelta(days=7))
    page_context["most_active_users"] = logs_per_user()
    page_context['active_users'] = active_users_json(request, beginning, now, 'day').content
    page_context['user_signups'] = user_signups_json(request).content

    # deployed apps stats
    page_context["avg_deployment_time"] = avg_deployment_time()
    page_context["num_deployed_apps"] = App.objects.filter(deployment_id__isnull=False).count()

    return render(request, 'admin/home.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_customers(request):
    page_context = {}
    page_context["customers"] = Customer.objects.all()
    return render(request, 'admin/customers.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_users(request):
    page_context = {}
    page_context["users"] = ExtraUserData.objects.all()
    return render(request, 'admin/users.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_user(request, user_id):
    user_id = long(user_id)
    user = get_object_or_404(ExtraUserData, id=user_id)
    logs = LogAnything.objects.filter(user_id=user_id)
    apps = App.objects.filter(owner=user_id)
    page_context = {}
    page_context["user"] = user
    page_context["apps"] = apps
    page_context["userlogs"] = logs
    page_context['user_logs_graph'] = user_logs_graph(request, user_id).content
    page_context["apps"] = apps
    return render(request, 'admin/user.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_apps(request):
    page_context = {}
    page_context["apps"] = App.objects.all()
    return render(request, 'admin/apps.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_app(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    logs = LogAnything.objects.filter(user_id=app.owner.id, app_id=app_id)
    page_context = {}
    page_context["app"] = app
    page_context["app_id"] = app_id
    page_context["app_logs"] = logs
    return render(request, 'admin/app.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_feedback(request):
    page_context = {}
    feedback = list(LogAnything.objects.filter(name='posted feedback'))
    page_context["feedback"] = feedback
    return render(request, 'admin/feedback.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_graphs(request):
    now = datetime.utcnow()
    now = int(time.mktime(now.timetuple()))
    beginning = datetime(year=2013, month=6, day=26)
    beginning = int(time.mktime(beginning.timetuple()))
    page_context = {}
    page_context["now"] = now
    page_context["beginning"] = beginning
    page_context['active_users'] = active_users_json(request, page_context['beginning'], page_context['now'], 'day').content
    page_context['user_signups'] = user_signups_json(request).content
    return render(request, 'admin/graphs.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def user_logs_graph(request, user_id):
    logs = get_logs({'user_id': long(user_id)})\
                .extra(select={'date': 'date(timestamp)'})\
                .values('date')\
                .annotate(num_logs=Count('id'))\
                .order_by('date')
    result = [{'date': str(x['date']), 'num_logs': x['num_logs']} for x in logs]
    return HttpResponse(json.dumps(result), mimetype="application/json")

@login_required
@user_passes_test(lambda u: u.is_superuser)
def logs(request):
    logs = get_logs(request.GET)
    result = [{'id': log.pk, 'user_id': log.user_id, 'app_id': log.app_id, 'name': log.name, 'timestamp': str(log.timestamp), 'data': log.data} for log in list(logs)]
    return HttpResponse(result, mimetype="application/json")

def get_logs(args):
    logs = LogAnything.objects
    if 'name' in args:
        logs = logs.filter(name=args['name'])
    if 'app_id' in args:
        logs = logs.filter(app_id=args['app_id'])
    if 'user_id' in args:
        logs = logs.filter(user_id=args['user_id'])
    if 'start' in args:
        logs = logs.filter(timestamp__gte=args['start'])
    if 'end' in args:
        logs = logs.filter(timestamp__lte=args['end'])
    return logs.exclude(user_id=None)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def user_signups_json(request):
    # group number of users by date (not datetime) user joined
    users = User.objects\
                .extra(select={'day_joined': 'date(date_joined)'})\
                .values('day_joined')\
                .annotate(num_users=Count('id'))\
                .order_by('day_joined')
    # format date objects as strings for JSON serialization
    result = [{'day_joined': str(x['day_joined']), 'num_users': x['num_users']} for x in list(users)]
    #result = [{str(x['day_joined']): x['num_users']} for x in users]
    return HttpResponse(json.dumps(result), mimetype="application/json")

@login_required
@user_passes_test(lambda u: u.is_superuser)
def active_users_json(request, t_start, t_end, t_delta):
    t_start = int(t_start)
    t_end = int(t_end)
    t_delta = str(t_delta)
    try:
        start = datetime.fromtimestamp(t_start)
        end = datetime.fromtimestamp(t_end)
    except ValueError:
        return HttpResponse("Invalid start/end values (%d,%d), must be passed as POSIX datetime number" % (int(t_start),int(t_end)), status=405)
    # require start < end
    if end < start:
        start, end = end, start
    # determine timedelta
    if (t_delta == "day"):
        delta = timedelta(days=1)
    elif (t_delta == "year"):
        delta = timedelta(days=365)
    elif (t_delta == "month"):
        delta = timedelta(days=30)
    elif (t_delta == "week"):
        delta = timedelta(weeks=1)
    else:
        return HttpResponse("invalid delta string (%s), must be 'day', 'week', 'month', or 'year'" % t_delta, status=405)

    tempStart = start
    tempEnd = tempStart + delta
    data = {}
    while tempEnd < end:
        data[tempStart.strftime("%m/%d/%y")] = num_active_users(tempStart, tempEnd)
        tempStart = tempEnd
        tempEnd = tempEnd + delta
    return HttpResponse(json.dumps(data), mimetype="application/json")


# active users this past week/day/month
def recent_users(long_ago=timedelta(days=1), limit=10):
    today = timezone.now().date()
    time_ago = today - long_ago
    users = LogAnything.objects.filter(timestamp__gte=time_ago)\
            .exclude(user_id=None)\
            .values_list('user_id', flat=True).distinct()
    if len(users) > limit:
        users = users[:limit]
    result = []
    for user_id in users:
        user = ExtraUserData.objects.get(user__id=long(user_id)).user
        num_logs = LogAnything.objects.filter(timestamp__gte=time_ago, user_id=user_id).count()
        fullName = "%s %s" % (user.first_name, user.last_name)
        num_apps = user.apps.count()
        result.append({'user_id': user_id, 'num_logs': num_logs, 'name': fullName, 'num_apps': num_apps})
    return result

# Top [limit] users with most page visits
def logs_per_user(limit=10):
    users = LogAnything.objects\
                .exclude(user_id=None)\
                .values_list('user_id', flat=True).distinct()
    if len(users) > limit:
        users = users[:10]
    result = []
    for user_id in users:
        user = ExtraUserData.objects.get(user__id=long(user_id)).user
        num_logs = LogAnything.objects.filter(user_id=user_id).count()
        obj = {}
        obj['user_id'] = user_id
        obj['user'] = user
        obj['num_apps'] = user.apps.count()
        obj['num_logs'] = num_logs
        result.append(obj)
    return result

def avg_deployment_time():
    deploy_logs_data = [log.data_json for log in get_logs({'name': "deployed app"})]
    deploy_times = []
    for d in deploy_logs_data:
        if "deploy_time" in d:
            number = float(d["deploy_time"].replace(" seconds", ""))
            deploy_times.append(number)
    if(len(deploy_times)):
        return sum(deploy_times) / len(deploy_times)
    else:
        return 0.0

# the number of unique apps deployed within the requested time frame
def deployed_apps(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return LogAnything.objects\
        .filter(timestamp__gte=min, timestamp__lte=max, name="deployed app")\
        .distinct('app_id').count()

# page views within the requested time frame
def pageviews(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return get_logs({'start': min, 'end': max, 'name': 'visited page'})


# users who joined within the requested time frame
def users_joined(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return User.objects\
        .filter(date_joined__gte=min, date_joined__lte=max)


# 'active users' during a min-max time period
# calculated by finding the number of users who logged a page view
#   within the requested time frame
def num_active_users(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return pageviews(min, max).values('user_id').distinct().count()


def JSONResponse(data, **kwargs):
    return HttpResponse(json.dumps(data, cls=DjangoJSONEncoder), mimetype="application/json", **kwargs)
