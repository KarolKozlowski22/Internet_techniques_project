from flask import Flask, render_template, request, redirect, url_for, flash
from models.models import db, User
from sqlalchemy.exc import IntegrityError


app = Flask(__name__)
app.jinja_env.auto_reload = True
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['STATIC_AUTO_RELOAD'] = True

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/main')
def main():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register-user', methods=['POST'])
def register_user():
    if request.method == 'POST':
        name = request.form.get('name')
        lastName = request.form.get('lastName')
        email = request.form.get('email')
        password = request.form.get('password')

        new_user = User(name=name, lastName=lastName, email=email, password=password)

        with app.app_context():
            try:
                db.session.add(new_user)
                db.session.commit()
                return redirect(url_for('registration_success'))
            except IntegrityError:
                db.session.rollback()
                return redirect(url_for('registration_error'))

@app.route('/login-user', methods=['POST'])
def login_user():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email, password=password).first()

        if user:
            return redirect(url_for('login_success'))
        else:
            return redirect(url_for('login_error'))


@app.route('/registration-success')
def registration_success():
    return render_template('registraion_success.html', flash_messages="Pomyślnie zarejestrowano użytkownika!")

@app.route('/registration-error')
def registration_error():
    return render_template('error.html', error_messages="Uzytkownik o podanych danych już istnieje")

@app.route('/login-success')
def login_success():
    return render_template('logged.html')

@app.route('/login-error')
def login_error():
    return render_template("error.html", error_messages="Nieprawidłowy email lub hasło")

@app.route('/register')
def register():
    return render_template('register.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
