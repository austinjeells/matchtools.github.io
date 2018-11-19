import json
import os
import re


def vet_input(username, couple_id):
    # Check for correct format of Username and Couple ID
    output = {}

    if len(couple_id) != 7 or re.search(r'[^ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789]', couple_id):
        output['success'] = False
        output['reason'] = 'Invalid Couple ID submitted.'

    if re.search('\W', username):
        output['success'] = False
        output['reason'] = 'Invalid Username submitted. Username must contain only normal alphanumeric characters.'

    return output


def handle_individual_post(request, req_type):
    # Gets list of all currently stored individual lists
    dir_path = os.path.dirname(os.path.abspath(__file__))
    individual_lists = os.path.join(dir_path, 'user_content', 'individual_lists')
    all_lists = []
    for (dirpath, dirnames, filenames) in os.walk(individual_lists):
        all_lists.extend(filenames)
        break

    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return '400'

        username = data['username']
        couple_id = data['id']
        print('Couple ID: ' + couple_id)

        # Check for appropriate Username and Couple ID
        output = vet_input(username, couple_id)
        if output:
            return output

        matching_files = [file for file in all_lists if re.match(couple_id, file[0:7])]
        print('Matching files: ')
        print(matching_files)
        number_matching_files = len(matching_files)

        # For rank list submission
        if req_type == 'submit':
            if number_matching_files > 2:
                output['success'] = False
                output['reason'] = 'Internal Error. Please resubmit lists with new Couple ID.'
                print('Too many matching files')
            elif number_matching_files == 2 and not any(re.search(username, file, re.I) for file in matching_files):
                print('Third username for Couple ID detected.')
                output['success'] = False
                output['reason'] = 'Two Usernames already associated with submitted Couple ID. Please ' \
                                   'ensure accuracy of Username and Couple ID, or create new Couple ID if your ' \
                                   'partner has not yet submitted their personal list.'
            elif number_matching_files <= 2:
                print('Adding individual rank list.')
                filename = couple_id + '_' + username.lower() + '.json'
                file_path = os.path.join(individual_lists, filename)
                with open(file_path, 'w') as f:
                    if number_matching_files == 2 and os.path.isfile(file_path):
                        # Truncate if overwriting file with same ID and username
                        f.truncate()
                    json.dump(data, f)
                output['success'] = True

        # For rank list retrieval
        elif req_type == 'retrieve':
            if number_matching_files != 2:
                output['success'] = False
                if number_matching_files > 2:
                    output['reason'] = 'Internal Error. Please resubmit lists with new Couple ID.'
                elif number_matching_files == 1:
                    output['reason'] = 'Only one list has been submitted with that Couple ID. Please ensure both ' \
                                       'members of couple have submitted their rank list.'
                elif number_matching_files == 0:
                    output['reason'] = 'No rank lists for submitted Couple ID were found. Please ensure you have ' \
                                       'correctly entered your Couple ID and both partners have submitted their list.'
                return json.dumps(output)

            if any(re.search(username, file, re.I) for file in matching_files):
                with open(os.path.join(individual_lists, matching_files[0])) as f:
                    output['a'] = json.load(f)
                with open(os.path.join(individual_lists, matching_files[1])) as f:
                    output['b'] = json.load(f)
                output['success'] = True
            else:
                output['success'] = False
                output['reason'] = 'Username not found to be associated with submitted Couple ID. Please ensure ' \
                                   'accuracy of both Couple ID and Username.'
        return json.dumps(output)
