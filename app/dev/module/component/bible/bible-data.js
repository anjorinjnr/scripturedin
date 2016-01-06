/**
 * Created by ebby on 12/28/2015.
 */
App.factory('bibleData', function () {


    var books = {
        "Gen": {
            "name": {
                "eng": "Genesis"
            },
            "names": {
                "eng": [
                    "Genesis",
                    "Ge",
                    "Gen"
                ]
            }
        },
        "Exod": {
            "name": {
                "eng": "Exodus"
            },
            "names": {
                "eng": [
                    "Exodus",
                    "Ex",
                    "Exo"
                ]
            }
        },
        "Lev": {
            "name": {
                "eng": "Leviticus"
            },
            "names": {
                "eng": [
                    "Leviticus",
                    "Le",
                    "Lev"
                ]
            }
        },
        "Num": {
            "name": {
                "eng": "Numbers"
            },
            "names": {
                "eng": [
                    "Numbers",
                    "Nu",
                    "Num"
                ]
            }
        },
        "Deut": {
            "name": {
                "eng": "Deuteronomy"
            },
            "names": {
                "eng": [
                    "Deuteronomy",
                    "Dt",
                    "Deut",
                    "Deu",
                    "De"
                ]
            }
        },
        "Josh": {
            "name": {
                "eng": "Joshua"
            },
            "names": {
                "eng": [
                    "Joshua",
                    "Js",
                    "Jos",
                    "Jos",
                    "Josh"
                ]
            }
        },
        "Judg": {
            "name": {
                "eng": "Judges"
            },
            "names": {
                "eng": [
                    "Judges",
                    "Jg",
                    "Jdg",
                    "Jdgs"
                ]
            }
        },
        "Ruth": {
            "name": {
                "eng": "Ruth"
            },
            "names": {
                "eng": [
                    "Ruth",
                    "Ru",
                    "Rut"
                ]
            }
        },
        "1Sam": {
            "name": {
                "eng": "1 Samuel"
            },
            "names": {
                "eng": [
                    "1 Samuel",
                    "1S",
                    "1 Sam",
                    "1Sam",
                    "1 Sa",
                    "1Sa",
                    "I Samuel",
                    "I Sam",
                    "I Sa"
                ]
            }
        },
        "2Sam": {
            "name": {
                "eng": "2 Samuel"
            },
            "names": {
                "eng": [
                    "2 Samuel",
                    "2S",
                    "2 Sam",
                    "2Sam",
                    "2 Sa",
                    "2Sa",
                    "II Samuel",
                    "II Sam",
                    "II Sa",
                    "IIS"
                ]
            }
        },
        "1Kgs": {
            "name": {
                "eng": "1 Kings"
            },
            "names": {
                "eng": [
                    "1 Kings",
                    "1K",
                    "1 Kin",
                    "1Kin",
                    "1 Ki",
                    "IK",
                    "1Ki",
                    "I Kings",
                    "I Kin",
                    "I Ki"
                ]
            }
        },
        "2Kgs": {
            "name": {
                "eng": "2 Kings"
            },
            "names": {
                "eng": [
                    "2 Kings",
                    "2K",
                    "2 Kin",
                    "2Kin",
                    "2 Ki",
                    "IIK",
                    "2Ki",
                    "II Kings",
                    "II Kin",
                    "II Ki"
                ]
            }
        },
        "1Chr": {
            "names": {
                "eng": [
                    "1 Chronicles",
                    "1Ch",
                    "1 Chr",
                    "1Chr",
                    "1 Ch",
                    "ICh",
                    "I Chronicles",
                    "I Chr",
                    "I Ch"
                ]
            },
            "name": {
                "eng": "1 Chronicles"
            }
        },
        "2Chr": {
            "names": {
                "eng": [
                    "2 Chronicles",
                    "2Ch",
                    "2 Chr",
                    "2 Chr",
                    "2Chr",
                    "2 Ch",
                    "IICh",
                    "II Chronicles",
                    "II Chr",
                    "II Ch"
                ]
            },
            "name": {
                "eng": "2 Chronicles"
            }
        },
        "Ezra": {
            "names": {
                "eng": [
                    "Ezra",
                    "Ezr"
                ]
            },
            "name": {
                "eng": "Ezra"
            }
        },
        "Neh": {
            "names": {
                "eng": [
                    "Nehemiah",
                    "Ne",
                    "Neh",
                    "Neh",
                    "Ne"
                ]
            },
            "name": {
                "eng": "Nehemiah"
            }
        },
        "Esth": {
            "names": {
                "eng": [
                    "Esther",
                    "Es",
                    "Est",
                    "Esth"
                ]
            },
            "name": {
                "eng": "Esther"
            }
        },
        "Job": {
            "names": {
                "eng": [
                    "Job",
                    "Jb",
                    "Job"
                ]
            },
            "name": {
                "eng": "Job"
            }
        },
        "Ps": {
            "names": {
                "eng": [
                    "Psalm",
                    "Ps",
                    "Psa"
                ]
            },
            "name": {
                "eng": "Psalm"
            }
        },
        "Prov": {
            "names": {
                "eng": [
                    "Proverbs",
                    "Pr",
                    "Prov",
                    "Pro"
                ]
            },
            "name": {
                "eng": "Proverbs"
            }
        },
        "Eccl": {
            "names": {
                "eng": [
                    "Ecclesiastes",
                    "Ec",
                    "Ecc",
                    "Qohelet"
                ]
            },
            "name": {
                "eng": "Ecclesiastes"
            }
        },
        "Song": {
            "names": {
                "eng": [
                    "Song of Songs",
                    "So",
                    "Sos",
                    "Song of Solomon",
                    "SOS",
                    "SongOfSongs",
                    "SongofSolomon",
                    "Canticle of Canticles"
                ]
            },
            "name": {
                "eng": "Song of Songs"
            }
        },
        "Isa": {
            "names": {
                "eng": [
                    "Isaiah",
                    "Is",
                    "Isa"
                ]
            },
            "name": {
                "eng": "Isaiah"
            }
        },
        "Jer": {
            "names": {
                "eng": [
                    "Jeremiah",
                    "Je",
                    "Jer"
                ]
            },
            "name": {
                "eng": "Jeremiah"
            }
        },
        "Lam": {
            "names": {
                "eng": [
                    "Lamentations",
                    "La",
                    "Lam",
                    "Lament"
                ]
            },
            "name": {
                "eng": "Lamentations"
            }
        },
        "Ezek": {
            "names": {
                "eng": [
                    "Ezekiel",
                    "Ek",
                    "Ezek",
                    "Eze"
                ]
            },
            "name": {
                "eng": "Ezekiel"
            }
        },
        "Dan": {
            "names": {
                "eng": [
                    "Daniel",
                    "Da",
                    "Dan",
                    "Dl",
                    "Dnl"
                ]
            },
            "name": {
                "eng": "Daniel"
            }
        },
        "Hos": {
            "names": {
                "eng": [
                    "Hosea",
                    "Ho",
                    "Hos"
                ]
            },
            "name": {
                "eng": "Hosea"
            }
        },
        "Joel": {
            "names": {
                "eng": [
                    "Joel",
                    "Jl",
                    "Joel",
                    "Joe"
                ]
            },
            "name": {
                "eng": "Joel"
            }
        },
        "Amos": {
            "names": {
                "eng": [
                    "Amos",
                    "Am",
                    "Amos",
                    "Amo"
                ]
            },
            "name": {
                "eng": "Amos"
            }
        },
        "Obad": {
            "names": {
                "eng": [
                    "Obadiah",
                    "Ob",
                    "Oba",
                    "Obd",
                    "Odbh"
                ]
            },
            "name": {
                "eng": "Obadiah"
            }
        },
        "Jonah": {
            "names": {
                "eng": [
                    "Jonah",
                    "Jh",
                    "Jon",
                    "Jnh"
                ]
            },
            "name": {
                "eng": "Jonah"
            }
        },
        "Mic": {
            "names": {
                "eng": [
                    "Micah",
                    "Mi",
                    "Mic"
                ]
            },
            "name": {
                "eng": "Micah"
            }
        },
        "Nah": {
            "names": {
                "eng": [
                    "Nahum",
                    "Na",
                    "Nah",
                    "Nah",
                    "Na"
                ]
            },
            "name": {
                "eng": "Nahum"
            }
        },
        "Hab": {
            "names": {
                "eng": [
                    "Habakkuk",
                    "Hb",
                    "Hab",
                    "Hk",
                    "Habk"
                ]
            },
            "name": {
                "eng": "Habakkuk"
            }
        },
        "Zeph": {
            "names": {
                "eng": [
                    "Zephaniah",
                    "Zp",
                    "Zep",
                    "Zeph"
                ]
            },
            "name": {
                "eng": "Zephaniah"
            }
        },
        "Hag": {
            "names": {
                "eng": [
                    "Haggai",
                    "Ha",
                    "Hag",
                    "Hagg"
                ]
            },
            "name": {
                "eng": "Haggai"
            }
        },
        "Zech": {
            "names": {
                "eng": [
                    "Zechariah",
                    "Zc",
                    "Zech",
                    "Zec"
                ]
            },
            "name": {
                "eng": "Zechariah"
            }
        },
        "Mal": {
            "names": {
                "eng": [
                    "Malachi",
                    "Ml",
                    "Mal",
                    "Mlc"
                ]
            },
            "name": {
                "eng": "Malachi"
            }
        },
        "Matt": {
            "names": {
                "eng": [
                    "Matthew",
                    "Mt",
                    "Matt",
                    "Mat"
                ]
            },
            "name": {
                "eng": "Matthew"
            }
        },
        "Mark": {
            "names": {
                "eng": [
                    "Mark",
                    "Mk",
                    "Mar",
                    "Mrk"
                ]
            },
            "name": {
                "eng": "Mark"
            }
        },
        "Luke": {
            "names": {
                "eng": [
                    "Luke",
                    "Lk",
                    "Luk",
                    "Lu"
                ]
            },
            "name": {
                "eng": "Luke"
            }
        },
        "John": {
            "names": {
                "eng": [
                    "John",
                    "Jn",
                    "Joh",
                    "Jo"
                ]
            },
            "name": {
                "eng": "John"
            }
        },
        "Acts": {
            "names": {
                "eng": [
                    "Acts",
                    "Ac",
                    "Act"
                ]
            },
            "name": {
                "eng": "Acts"
            }
        },
        "Rom": {
            "names": {
                "eng": [
                    "Romans",
                    "Ro",
                    "Rom",
                    "Rmn",
                    "Rmns"
                ]
            },
            "name": {
                "eng": "Romans"
            }
        },
        "1Cor": {
            "names": {
                "eng": [
                    "1 Corinthians",
                    "1Co",
                    "1 Cor",
                    "1Cor",
                    "ICo",
                    "1 Co",
                    "1Co",
                    "I Corinthians",
                    "I Cor",
                    "I Co"
                ]
            },
            "name": {
                "eng": "1 Corinthians"
            }
        },
        "2Cor": {
            "names": {
                "eng": [
                    "2 Corinthians",
                    "2Co",
                    "2 Cor",
                    "2Cor",
                    "IICo",
                    "2 Co",
                    "2Co",
                    "II Corinthians",
                    "II Cor",
                    "II Co"
                ]
            },
            "name": {
                "eng": "2 Corinthians"
            }
        },
        "Gal": {
            "names": {
                "eng": [
                    "Galatians",
                    "Ga",
                    "Gal",
                    "Gltns"
                ]
            },
            "name": {
                "eng": "Galatians"
            }
        },
        "Eph": {
            "names": {
                "eng": [
                    "Ephesians",
                    "Ep",
                    "Eph",
                    "Ephn"
                ]
            },
            "name": {
                "eng": "Ephesians"
            }
        },
        "Phil": {
            "names": {
                "eng": [
                    "Philippians",
                    "Pp",
                    "Phi",
                    "Phil",
                    "Phi"
                ]
            },
            "name": {
                "eng": "Philippians"
            }
        },
        "Col": {
            "names": {
                "eng": [
                    "Colossians",
                    "Co",
                    "Col",
                    "Colo",
                    "Cln",
                    "Clns"
                ]
            },
            "name": {
                "eng": "Colossians"
            }
        },
        "1Thess": {
            "names": {
                "eng": [
                    "1 Thessalonians",
                    "1Th",
                    "1 Thess",
                    "1Thess",
                    "ITh",
                    "1 Thes",
                    "1Thes",
                    "1 The",
                    "1The",
                    "1 Th",
                    "1Th",
                    "I Thessalonians",
                    "I Thess",
                    "I The",
                    "I Th"
                ]
            },
            "name": {
                "eng": "1 Thessalonians"
            }
        },
        "2Thess": {
            "names": {
                "eng": [
                    "2 Thessalonians",
                    "2Th",
                    "2 Thess",
                    "2 Thess",
                    "2Thess",
                    "IITh",
                    "2 Thes",
                    "2Thes",
                    "2 The",
                    "2The",
                    "2 Th",
                    "2Th",
                    "II Thessalonians",
                    "II Thess",
                    "II The",
                    "II Th"
                ]
            },
            "name": {
                "eng": "2 Thessalonians"
            }
        },
        "1Tim": {
            "names": {
                "eng": [
                    "1 Timothy",
                    "1Ti",
                    "1 Tim",
                    "1Tim",
                    "1 Ti",
                    "ITi",
                    "1Ti",
                    "I Timothy",
                    "I Tim",
                    "I Ti"
                ]
            },
            "name": {
                "eng": "1 Timothy"
            }
        },
        "2Tim": {
            "names": {
                "eng": [
                    "2 Timothy",
                    "2Ti",
                    "2 Tim",
                    "2 Tim",
                    "2Tim",
                    "2 Ti",
                    "IITi",
                    "2Ti",
                    "II Timothy",
                    "II Tim",
                    "II Ti"
                ]
            },
            "name": {
                "eng": "2 Timothy"
            }
        },
        "Titus": {
            "names": {
                "eng": [
                    "Titus",
                    "Ti",
                    "Tit",
                    "Tt",
                    "Ts"
                ]
            },
            "name": {
                "eng": "Titus"
            }
        },
        "Phlm": {
            "names": {
                "eng": [
                    "Philemon",
                    "Pm",
                    "Phile",
                    "Phile",
                    "Philm",
                    "Pm"
                ]
            },
            "name": {
                "eng": "Philemon"
            }
        },
        "Heb": {
            "names": {
                "eng": [
                    "Hebrews",
                    "He",
                    "Heb",
                    "Hw"
                ]
            },
            "name": {
                "eng": "Hebrews"
            }
        },
        "Jas": {
            "names": {
                "eng": [
                    "James",
                    "Jm",
                    "Jam",
                    "Jas",
                    "Ja"
                ]
            },
            "name": {
                "eng": "James"
            }
        },
        "1Pet": {
            "names": {
                "eng": [
                    "1 Peter",
                    "1P",
                    "1 Pet",
                    "1Pet",
                    "IPe",
                    "1P",
                    "I Peter",
                    "I Pet",
                    "I Pe"
                ]
            },
            "name": {
                "eng": "1 Peter"
            }
        },
        "2Pet": {
            "names": {
                "eng": [
                    "2 Peter",
                    "2P",
                    "2 Pet",
                    "2Pet",
                    "2Pe",
                    "IIP",
                    "II Peter",
                    "II Pet",
                    "II Pe"
                ]
            },
            "name": {
                "eng": "2 Peter"
            }
        },
        "1John": {
            "names": {
                "eng": [
                    "1 John",
                    "1J",
                    "1 Jn",
                    "1Jn",
                    "1 Jo",
                    "IJo",
                    "I John",
                    "I Jo",
                    "I Jn"
                ]
            },
            "name": {
                "eng": "1 John"
            }
        },
        "2John": {
            "names": {
                "eng": [
                    "2 John",
                    "2J",
                    "2 Jn",
                    "2Jn",
                    "2 Jo",
                    "IIJo",
                    "II John",
                    "II Jo",
                    "II Jn"
                ]
            },
            "name": {
                "eng": "2 John"
            }
        },
        "3John": {
            "names": {
                "eng": [
                    "3 John",
                    "3J",
                    "3 Jn",
                    "3 Jn",
                    "3Jn",
                    "3 Jo",
                    "IIIJo",
                    "III John",
                    "III Jo",
                    "III Jn"
                ]
            },
            "name": {
                "eng": "3 John"
            }
        },
        "Jude": {
            "names": {
                "eng": [
                    "Jude",
                    "Jude",
                    "Jude"
                ]
            },
            "name": {
                "eng": "Jude"
            }
        },
        "Rev": {
            "names": {
                "eng": [
                    "Revelation",
                    "Re",
                    "Rev",
                    "Rvltn"
                ]
            },
            "name": {
                "eng": "Revelation"
            }
        }
    };
    return {
        'books': books
    };

});
