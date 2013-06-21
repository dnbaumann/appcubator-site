define([
  'collections/EmailCollection',
  'models/EmailModel',
  'app/EmailView',
  'mixins/BackboneNameBox',
  'util'
],
function(EmailCollection, EmailModel, EmailView) {

  var EmailsView = Backbone.View.extend({
    events: {
      'click #email-list li.email-list-item': 'clickedEmail',
      'click #save-emails'               : 'saveEmails',
      'dragstart #variables-list li': 'setupDrag',
    },

    initialize: function() {
      _.bindAll(this);

      this.collection = v1State.get('emails') || new EmailCollection();
      this.listenTo(this.collection, 'all', this.renderEmailList);

      //setup emailView, populate with first email (new email if none)
      var firstEmail;
      if(this.collection.length > 0) {
        firstEmail = this.collection.at(0);
      }
      else {
        firstEmail = this.collection.add({});
      }
      this.emailView = new EmailView({ model: firstEmail });
      this.listenTo(this.emailView, 'change:model', this.showActiveEmail);
    },

    render: function() {
      this.el.innerHTML = _.template(util.getHTML('emails-page'), {});
      this.listView = this.$el.find('#email-list');
      this.renderEmailList();
      this.renderVariableList();
      this.emailView.setElement(this.$el.find('.right-bar')).render();

      return this;
    },

    renderEmailList: function() {
      //don't render email list if parent view hasn't been rendered yet
      if(!this.listView) {
        return false;
      }
      this.listView.empty();
      this.collection.each(function(email){
        this.appendEmail(email);
      }, this);

      // append 'create email' btn to list
      var createEmailBox = new Backbone.NameBox({
        tagName: 'li',
        className: 'create-email',
        txt: '+ Create Email'
      });
      createEmailBox.on('submit', this.createEmail);
      this.listView.append(createEmailBox.el);

      return this;
    },

    renderVariableList: function() {
      var vars = v1State.get('users').getCommonProps();
      console.log(vars);
      var list = this.$('#variables-list');
      _(vars).each(function(variable) {
        var li = document.createElement('li');
        li.setAttribute('draggable', 'true');
        li.innerHTML = "CurrentUser." + variable.get('name');
        list.append(li);
      });

      return this;
    },

    clickedEmail: function(e) {
      var cid = e.currentTarget.dataset.cid;
      var emailModel = this.collection.get(cid);
      this.emailView.setModel(emailModel);
      e.target.classList.add('active');
    },

    createEmail: function(name) {
      var email = new EmailModel({ name: name });
      this.collection.add(email);
      this.emailView.setModel(email);
    },

    appendEmail: function(email) {
      this.listView.append('<li class="email-list-item" data-cid="' + email.cid + '">' + email.get('name') + '</li>');
    },

    saveEmails: function(e) {
      appState.emails = this.collection.toJSON();

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(v1State),
        success: function() {},
        dataType: "JSON"
      });
    },

    showActiveEmail: function(model) {
      this.listView.find('li').removeClass('active')
                   .filter('[data-cid="'+this.emailView.model.cid+'"]').addClass('active');
    },

    setupDrag: function(e) {
      e.dataTransfer.setData('text/plain', "  {{" + e.target.innerText + "}} ");
    }

  });

  return EmailsView;
});
