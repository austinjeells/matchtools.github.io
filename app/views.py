#!flask/bin/python
import json

from flask import Flask, render_template, request

from app.couples_match import handle_xml
from app.couples_match_ind import handle_individual_post


app = Flask(__name__)


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html',
                           title='Home')


@app.route('/encryption')
def encryption():
    return render_template('encryption.html')


@app.route('/encryptionLogPost', methods=['GET', 'POST'])
def encryption_log_post():
    log_data = request.get_json()
    log_complete = False
    log_count = 1

    while not log_complete:
        try:
            f = open(
                r'C:\Users\Nick\Dropbox\Coding\PycharmProjects\FlaskApp\tmp\log_' + str(log_count) + r'.json',
                'x')
        except FileExistsError:
            log_count += 1
            continue
        else:
            json.dump(log_data, f)
            f.close()
            log_complete = True
    return "Log received"


@app.route('/couplesmatch')
def couples_match():
    return render_template('couplesmatch.html', title='Tool for the Couples Match')


@app.route('/couplesmatchsubmit', methods=['GET', 'POST'])
def couples_match_submit():
    return handle_xml(request)


@app.route('/couplesmatchindsub', methods=['POST'])
def couples_match_submit_individually():
    return handle_individual_post(request, 'submit')


@app.route('/couplesmatchretrieval', methods=['POST'])
def couples_match_retrieval():
    return handle_individual_post(request, 'retrieve')
