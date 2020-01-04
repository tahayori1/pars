var callback = function () {
    document.querySelector('#header').onclick = function () { loadMenu(); return false; }
function log (x){
   // console.log(x)
}
    // Handler when the DOM is fully loaded
    var socket = io();
    var clientinputprocess = false;
    var clientinputcntr = 0;
    var clientinputquestions = [];
    var clientinputanswer = {};
    var defform = '<input id="m" autofocus autocomplete="off" />';
    var series = '';
    loadMenu();
    function msgProcessor(msg) {
        msg = JSON.parse(msg);
        log('Recieved', msg)
        return msg;
    }
    function emitter(room, msg) {
        var str = {
            date: new Date().getTime(),
            message: msg,
        }
        socket.emit(room, JSON.stringify(str));
    }
    function loadMenu() {
        clientinputprocess = false;
        clientinputanswer = {};
        emitter('menu', 'show');
        socket.on('menu', (msg) => {
            var hh = window.innerHeight - 50;
            document.querySelector('#header h1').innerHTML = 'موسسه زبان پارسا';
            document.querySelector('ul#FirstMenu').innerHTML = '';
            document.querySelector('ul#FirstMenu').setAttribute('style', '');
            document.querySelector('ul#FirstMenu').setAttribute('style', 'height : ' + hh + 'px !important;')
            document.querySelector('#messages').innerHTML = '';
            document.querySelector('#messages').setAttribute('style', 'display: none;');
            document.querySelector('form').setAttribute('style', 'display: none !important');
            msg = msgProcessor(msg);
            msg = msg.message;
            var str = '';
            msg.forEach((itm) => {
                str = '<li><div class="photo"></div><div class="cntent"><h2>' + itm.title + '</h2><span class="tme">' + itm.time + '</span><p>' + itm.desc + '</p><span class="cntr"></span></div></li>'
                document.querySelector('ul#FirstMenu').innerHTML += str;

            });
            document.querySelectorAll('ul#FirstMenu li').forEach((el) => { el.onclick = function () { loadChat(el.querySelector('h2').innerText); return false; } })

        });
    }

    socket.on('loadChat', (msg) => {
        msg = msgProcessor(msg);
        msg = msg.message;
        if (msg == 'ready') {
            clientinputprocess = false;
            send('شروع');
        }
    })
    function loadChat(itm) {
        document.querySelector('#header h1').innerHTML = itm;
        document.querySelector('ul#FirstMenu').innerHTML = '';
        document.querySelector('ul#FirstMenu').setAttribute('style', 'display: none !important');
        document.querySelector('form').setAttribute('style', '');
        document.querySelector('#messages').innerHTML = '';
        document.querySelector('#messages').setAttribute('style', '');
        series = [];
        series.push(itm);
        emitter('loadChat', itm)
        return false;
    }
    //var socket = io();
    document.forms[0].onsubmit = function () {
        var reqq = document.querySelector('#m').value;
        send(reqq);
        return false;
    };
    function send(requ) {
        window.scrollTo(0, document.body.scrollHeight);
        if (requ == 'خروج') { loadMenu(); }
        else {
            var date = new Date();
            date = formatter(date);

            setTimeout(() => {
                document.querySelector('#messages').innerHTML += '<li class="req"><div class="you">شما</div><p>' + requ + '</p><div class="tme">' + date + '</div></li>';
                return false;
            }, 10)


            if (clientinputquestions[clientinputcntr] && clientinputquestions[clientinputcntr].name) {
                clientinputanswer[clientinputquestions[clientinputcntr].name] = requ;
                log(clientinputprocess, clientinputcntr, 'of', clientinputquestions.length, clientinputanswer);
            }
            clientinputcntr++;
            if (clientinputprocess) {
                if (clientinputquestions.length > clientinputcntr) {

                    if (clientinputquestions[clientinputcntr].type == 'select') {
                        inputProcessor(clientinputquestions[clientinputcntr].name, selectProcessor(clientinputquestions[clientinputcntr].items), date)

                    } else {
                        inputProcessor(clientinputquestions[clientinputcntr].name + '<br><span class="note">' + clientinputquestions[clientinputcntr].desc + '</span>', defform, date)
                    }
                } else {
                    if (requ == 'خیر') {
                        clientinputprocess = true;
                        clientinputcntr = 0;
                        log(clientinputquestions)
                        inputProcessor(clientinputquestions[clientinputcntr].name, defform, date);
                    } else if (requ == 'بله') {
                        clientinputprocess = false;
                        series.push(JSON.stringify(clientinputanswer))
                        series.unshift('#reg');
                        log(series.toString())
                        emitter('room', series.toString());
                    } else {
                        var str11 = 'اطلاعات دریافتی به شرح زیر است آیا تایید می کنید؟<br>'
                        for (i in clientinputanswer) {
                            str11 += i + ':<b>' + clientinputanswer[i] + '</b><br>'
                        }
                        inputProcessor(str11, selectProcessor(['بله', 'خیر']), date);
                    }

                }
            } else {
                series.push(requ);
                log(series.toString())
                emitter('room', series.toString());
            }
            if (document.querySelector('#m')) document.querySelector('#m').value = '';
            window.scrollTo(0, document.body.scrollHeight);
            return false;
        }
    }

    function inputProcessor(inputitem, resType, date) {
        setTimeout(() => {
            var str = '<li class="res"><div class="you">ربات پارسا</div><p>' + inputitem + '<p><div class="tme">' + date + '</div></li>'
            document.querySelector('#messages').innerHTML += str;
            document.querySelector('form').innerHTML = resType;
            document.querySelectorAll('li.link').forEach((el) => { el.onclick = function () { send(el.innerText); return false; } })
            window.scrollTo(0, document.body.scrollHeight);
            return false;
        }, 50);
        /*document.querySelector('input#m').focus();*/

    }
    function selectProcessor(msg) {
        var str = '<ul>';
        msg.forEach((x) => { str += '<li class="link">' + x + '</li>' });
        str += '<li class="link">خروج</li>'
        str += '</ul>'
        return str;
    }
    function formatter(date) {

        var y = _zero( date.getHours()) + ':' + _zero(date.getMinutes())
        function _zero(x) {
            if (x < 10) {
                   x = '0' + x;
                   return x;
            }else{
                return x;
            }
        }
        return y;
    }
    socket.on('room', function (msg) {

        msg = msgProcessor(msg);
        var date = new Date(msg.date);
        msg = msg.message;
        date = formatter(date)
        log(msg);
        if (msg != undefined) {
            var tx = Object.keys(msg)[0];

            if (msg[tx].type) {
                msg = msg[tx];
            } else if (msg.type) {
                msg = msg;
                tx = msg.text;
            }
            switch (msg.type) {
                case 'select':
                    str = selectProcessor(Object.keys(msg.items))
                    inputProcessor(tx, str, date)
                    break;
                case 'input':
                    clientinputprocess = true;
                    clientinputanswer = {}
                    clientinputcntr = 0;
                    clientinputquestions = msg.items;
                    inputProcessor(tx, defform, date)
                    inputProcessor(clientinputquestions[0].name + '<br><span class="note">' + clientinputquestions[0].desc + '</span>', defform, date)
                    break;
                case 'text':
                    inputProcessor(tx, defform, date)
                    break;
                default:
                    inputProcessor(msg, defform, date)
                    break;
            }
        }
    });
};
if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    callback();
} else {
    document.addEventListener("DOMContentLoaded", callback);
}