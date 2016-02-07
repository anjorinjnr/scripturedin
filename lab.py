class Parent(object):
    def test(self):
        self.in_child()


class Child(Parent):
    def in_child(self):
        print 123


def run():
    v = 3
    r = (v and v > 2)
    print r


if __name__ == '__main__':
    run()
