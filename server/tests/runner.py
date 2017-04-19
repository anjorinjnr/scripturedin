import os
import sys
import unittest
import optparse


USAGE = """%prog SDK_PATH
Run unit tests for App Engine apps.

SDK_PATH    Path to Google Cloud or Google App Engine SDK installation, usually
            ~/google_cloud_sdk"""


def main(sdk_path):
    path = os.path.realpath(__file__)
    tests_path = '/tests'
    lib__path='/lib'
    if tests_path not in path:
       tests_path = '\\tests'
       lib__path = '\\lib'

    base = path[:path.index(tests_path)]


    sys.path.insert(1, base)
    sys.path.insert(1, base + lib__path)
    sys.path.insert(1, sdk_path)
    #sys.path.insert(1, '/usr/local/google_appengine/lib')
    #sys.path.insert(1, '/usr/local/google_appengine/lib/yaml/lib')

    import dev_appserver
    dev_appserver.fix_sys_path()

    suite = unittest.loader.TestLoader().discover(base + tests_path)
    unittest.TextTestRunner(verbosity=2).run(suite)


if __name__ == '__main__':
    parser = optparse.OptionParser(USAGE)
    options, args = parser.parse_args()
    if len(args) != 1:
       print 'Error: Exactly 1 argument required.'
       parser.print_help()
       sys.exit(1)
    SDK_PATH = args[0]
    #TEST_PATH = args[1]
    main(SDK_PATH)