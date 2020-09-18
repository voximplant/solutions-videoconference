require(Modules.Conference);
require(Modules.WebSocket);

const WSS_SERVER = '';
let conf_id = '';
let sessionId = '';
let ws = '';
const uuidUsers = {};

let conf = null;
VoxEngine.addEventListener(AppEvents.Started, ev => {
    setInterval(() => {
        if(JSession_getLeftMemBytes()<10000000) JSession_GC();
    }, 5000)
    sessionId = ev.sessionId;
    ws = new WebSocket(WSS_SERVER);
    ws.addEventListener('open', ev => {
        ws.send(JSON.stringify({
            cmd: 'srvHello',
            content: {
                sessionId: sessionId
            }
        }));
    })
    conf = VoxEngine.createConference();
    conf.addEventListener(ConferenceEvents.Stopped, _ => Logger.write('Conference stoped'));
    conf.addEventListener(ConferenceEvents.Started, ev => Logger.write(`Conference started id=${ev.conference.getId}`));
})
VoxEngine.addEventListener(AppEvents.CallAlerting, onCallAlerting);

function notifyActive(ev) {
    const id = ev.call.id();
    const message = {
        cmd: 'srvVAD',
        from: id,
        content: ev.active,
        sessionId: sessionId + ""
    }
    ws.send(JSON.stringify(message));
}

function connectWebRTCClient(event) {
    conf.add({
        call: event.call,
        mode: "FORWARD",
        direction: "BOTH",
        scheme: event.scheme,
        displayName: event.headers['X-Display-Name']
    });
    event.call.handleMicStatus(true);
    event.call.addEventListener(CallEvents.MicStatusChange, notifyActive)
    event.call.answer({ 'X-Conf-Sess': sessionId, 'X-Conf-Call': event.call.id(), 'X-WS': WSS_SERVER });
    event.call.addEventListener(CallEvents.Disconnected, onDisconnect);
}

function connectPSTNClient(event, displayName) {
    conf.add({
        call: event.call,
        mode: "MIX",
        direction: "BOTH",
        scheme: event.scheme,
        displayName: "PSTN:" + displayName
    });
    event.call.addEventListener(CallEvents.Disconnected, onDisconnect);
    event.call.answer();
}

function onCallAlerting(ev) {
    if (ev.headers['X-UUID']) {
        if (uuidUsers[ev.headers['X-UUID']])
            uuidUsers[ev.headers['X-UUID']].hangup({ 'X-Multiple-Login': true });
        uuidUsers[ev.headers['X-UUID']] = ev.call;
    }
    conf_id = ev.destination;
    if (ev.headers['VI-Client-Device'] === 'WebRTC')
        connectWebRTCClient(ev);
    else
        connectPSTNClient(ev, ev.call.callerid());
}

async function onDisconnect(ev) {
    ev.call.removeEventListener(CallEvents.Disconnected);
    ev.call.removeEventListener(CallEvents.MicStatusChange);
    if (conf.getList().length === 0) {
        conf.stop();
        VoxEngine.terminate();
    }
}
