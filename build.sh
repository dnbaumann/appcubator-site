#!/usr/bin/env bash

# NOTE: `r.js -v` should be 2.1.5

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pushd $DIR/appcubator

cp ./static/js/application/main-app/main.js ./static/js/application/main-app/main.js.backup
echo "[BUILD] Copied main.js to main.js.backup"
lessc --verbose --rootpath=/static/css/app/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/app/app.less ./static/css/app/app.css
echo "[BUILD] Compiled app/style.less to app.css"
lessc --verbose --rootpath=/static/css/app/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/internal.less ./static/css/internal.css
echo "[BUILD] Compiled app/style.less to internal.css"
lessc --verbose --rootpath=/static/css/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/documentation.less ./static/css/documentation.css
echo "[BUILD] Compiled documentation.less to documentation.css"
r.js -o ./static/build/app.build.js
mv ./static/js/application/main-app/main.js.backup ./static/js/application/main-app/main.js

echo "[BUILD] Running manage.py collectstatic"

popd

python manage.py collectstatic --noinput

echo "[BUILD] Done"
