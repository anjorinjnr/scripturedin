from google.appengine.ext import vendor

import logging
import google

logging.info("google path: {}.".format(google.__file__))

# Add any libraries installed in the "lib" folder.
# vendor.add('lib')