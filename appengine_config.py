from google.appengine.ext import vendor

import logging
import google
import os
logging.info("google path: {}.".format(google.__file__))

# Add any libraries installed in the "lib" folder.
#vendor.add('lib')
print 'here....'
vendor.add(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'lib'))