var callback = function () {
    document.querySelector('#header').onclick = function () {


        return false;
    }

    function log(x) {
        console.log(x)
    }
    // Handler when the DOM is fully loaded
    var socket = io();
    var clientinputprocess = false;
    var clientinputcntr = 0;
    var clientinputquestions = [];
    var clientinputanswer = {};
    var defform = '<input id="m" autofocus autocomplete="off" />';
    var series = [];

    send('شروع');

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

    //var socket = io();
    document.forms[0].onsubmit = function () {
        var reqq = document.querySelector('#m').value;
        send(reqq);
        return false;
    };

    function send(requ) {
        window.scrollTo(0, document.body.scrollHeight);
        if (requ == 'خروج') {
            clientinputprocess = false;
            series = [];
            send('شروع');
        } else {
            var date = new Date();
            date = formatter(date);

            setTimeout(() => {
                document.querySelector('#messages').innerHTML += '<div class="msg"><div class="req"><div class="you">شما</div><p>' + requ + '</p><div class="tme">' + date + '</div></div><div>';
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
                        inputProcessor(clientinputquestions[clientinputcntr].name + '<br><span class="note">' + clientinputquestions[clientinputcntr].desc + '</span>', '', date)
                    }
                } else {
                    if (requ == 'خیر') {
                        clientinputprocess = true;
                        clientinputcntr = 0;
                        log(clientinputquestions)
                        inputProcessor(clientinputquestions[clientinputcntr].name, '', date);
                    } else if (requ == 'بله') {
                        clientinputprocess = false;
                        series.push(JSON.stringify(clientinputanswer))
                        series.unshift('#reg');
                        log(series.toString())
                        emitter('chat', series.toString());
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
                emitter('chat', series.toString());
            }
            if (document.querySelector('#m')) document.querySelector('#m').value = '';
            window.scrollTo(0, document.body.scrollHeight);
            return false;
        }
    }

    function inputProcessor(inputitem, resType, date) {
        setTimeout(() => {
            var str = '<div class="msg"><div class="res"><div class="you">ربات پارسا</div><p>' + inputitem + '<p><div class="tme">' + date + '</div></div>' + resType + '</div>'
            document.querySelector('#messages').innerHTML += str;
            document.querySelectorAll('div.link').forEach((el) => {
                el.onclick = function () {
                    send(el.innerText);
                    return false;
                }
            })
            window.scrollTo(0, document.body.scrollHeight);
            return false;
        }, 50);
        /*document.querySelector('input#m').focus();*/

    }

    function selectProcessor(msg) {
        var str = '<div class="actions">';
        msg.forEach((x) => {
            str += '<div class="link">' + x + '</div>'
        });
        str += '<div class="link">خروج</div>'
        str += '</div>'
        return str;
    }

    function formatter(date) {

        var y = _zero(date.getHours()) + ':' + _zero(date.getMinutes())

        function _zero(x) {
            if (x < 10) {
                x = '0' + x;
                return x;
            } else {
                return x;
            }
        }
        return y;
    }

    socket.on('chat', function (msg) {
        msg = msgProcessor(msg);
        var date = new Date(msg.date);
        msg = msg.message;
        date = formatter(date)
        log(msg);
        if (msg != undefined) {
            var tx = Object.keys(msg)[0];
            if (msg[tx] && msg[tx].type) {
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
                    inputProcessor(tx, '', date)
                    inputProcessor(clientinputquestions[0].name + '<br><span class="note">' + clientinputquestions[0].desc + '</span>', '', date)
                    break;
                case 'text':
                    inputProcessor(tx, selectProcessor([]), date)
                    break;
                default:
                    inputProcessor(msg, selectProcessor([]), date)
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
