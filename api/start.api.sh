python manage.py collectstatic --no-input &&
python manage.py migrate &&
gunicorn --worker-tmp-dir /dev/shm -c iprayio/gunicorn/conf.py config.wsgi:application
