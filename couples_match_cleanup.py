import os
import time


def ind_cleanup():
    print('Cleaning up individual lists.')
    dir_path = os.path.dirname(os.path.abspath(__file__))
    individual_lists = os.path.join(dir_path, 'app', 'user_content', 'individual_lists')
    all_lists = []
    for (dirpath, dirnames, filenames) in os.walk(individual_lists):
        all_lists.extend(filenames)
        break
    for file in all_lists:
        file_path = os.path.join(individual_lists, file)
        last_modified = os.stat(file_path).st_mtime
        if time.time() - last_modified > 1.21e+6:
            print('Deleting ' + file_path)
            os.remove(file_path)


def couples_cleanup():
    print('Cleaning up couples rank lists.')
    dir_path = os.path.dirname(os.path.abspath(__file__))
    rank_lists = os.path.join(dir_path, 'app', 'user_content', 'rank_lists')
    all_lists = []
    for (dirpath, dirnames, filenames) in os.walk(rank_lists):
        all_lists.extend(filenames)
        break
    for file in all_lists:
        file_path = os.path.join(rank_lists, file)
        last_modified = os.stat(file_path).st_mtime
        if time.time() - last_modified > 86400:
            print('Deleting ' + file_path)
            os.remove(file_path)

if __name__ == '__main__':
    ind_cleanup()
    couples_cleanup()