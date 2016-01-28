import re


def _required(value):
    if value:
        return True
    else:
        return False


def _email(value):
    return re.match(r'[^@]+@[^@]+\.[^@]+', value)

REQUIRED = 'required'
EMAIL = 'email'

VALIDATORS = {
    REQUIRED: _required,
    EMAIL: _email
}

class Validator(object):
    def __init__(self, config, data, messages=None):
        self.config = config
        self.data = data
        self.error = 0
        self.errors = []
        self.messages = messages

    def _fail(self, field, validator=None):
        self.error += 1
        if self.messages and field in self.messages:
            msg = self.messages[field]
            self.errors.append(msg)
            # if isinstance(msg, dict) and validator in msg:
            #     self.errors.append(msg[validator])
            # else:
            #     self.errors.append(self.messages[field])
        else:
            self.errors.append('%s is invalid' % field)

    def _validate(self):
        try:
            for field, config in self.config.iteritems():
                if field in self.data:
                    rules = config.split('|')
                    for rule in rules:
                        rule = rule.strip()
                        if rule not in VALIDATORS:
                            #print 'skipping %s' % rule
                            continue
                        validate = VALIDATORS[rule]
                        value = self.data[field]
                        if not value or not validate(value):
                            self._fail(field)
                            break
                else:
                    self._fail(field)

        except Exception as e:
            print 'error'
            print e

    def is_valid(self):
        self._validate()
        return self.error == 0
