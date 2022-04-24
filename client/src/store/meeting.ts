import { createEffect, createEvent, createStore } from 'effector';
import appConfig from '@/config';
import { authStore, makeAuthHeaders } from '@/store/auth';
import { createChat, joinChat } from '@/store/chat/index';
import { Events, joinConference } from '@voximplant/websdk/modules/conference';
import { $mirrorStore } from '@/store/mirrorMedia/index';
import { endpointEventList } from '@/store/webrtc/endpointManager';
import { ConferenceSignaling } from '@/services/ConferenceSignaling';
import { clearReaction } from '@/store/reactions';

interface EndpointMidStore {
  [mid: string]: 'audio' | 'video';
}

interface EndpointAdded {
  endpointId: string;
  displayName: string;
  mids: EndpointMidStore;
  tracks: { [key: string]: MediaStreamTrack };
}

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
type Conference = Awaited<ReturnType<typeof joinConference>>;

interface MeetingDescription {
  meetingId?: string;
  voxMeetingId?: string;
  owner?: boolean;
  meeting?: Conference;
}

enum statusType {
  'none',
  'connection',
  'waitingConfirmation',
  'denialAccess',
}

interface UserStatus {
  status: statusType;
}

interface MediaDescription {
  track: MediaStreamTrack;
  kind: 'audio' | 'video';
}
const changeUserStatus = createEvent<statusType>();

const createMeeting = createEffect<void, MeetingDescription, void>(async () => {
  const currentConv = await createChat();
  const voxMeetingId = currentConv.uuid;
  console.error(`${appConfig.baseServerUrl}uuids/get-short-uuid`);
  const response = await fetch(`${appConfig.baseServerUrl}uuids/get-short-uuid`, {
    method: 'POST',
    headers: {
      ...makeAuthHeaders(),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uuid: voxMeetingId }),
  });
  const json = await response.json();
  if (json.result) {
    return {
      meetingId: json.data.uuid,
      voxMeetingId: voxMeetingId,
      owner: json.data.is_owner,
    };
  }
  throw Error(json.error);
});

const startMeeting = createEffect<string, Conference, void>(async (meetingId: string) => {
  const media: MediaDescription[] = [];
  const currentTracks = $mirrorStore.getState();
  const mids: EndpointMidStore = {};
  const tracks: { [key: string]: MediaStreamTrack } = {};
  if (!currentTracks.audioPreview) {
    throw new Error('Dont have a audio');
  } else {
    media.push({ track: currentTracks.audioPreview, kind: 'audio' } as MediaDescription);
    mids['0'] = 'audio';
    tracks['0'] = currentTracks.audioPreview as MediaStreamTrack;
  }

  if (currentTracks.videoPreview) {
    console.error('currentTracks.videoPreview', currentTracks.videoPreview);
    media.push({ track: currentTracks.videoPreview, kind: 'video' } as MediaDescription);
    mids['1'] = 'video';
    tracks['1'] = currentTracks.videoPreview as MediaStreamTrack;
  }

  const currentMeeting = await joinConference({
    number: meetingId,
    sendOptions: {
      media,
    },
  });
  console.error('currentMeeting', currentMeeting);
  currentMeeting.addEventListener(Events.EndpointAdded, (ev: any) => {
    console.error('EndpointAdded', ev);
    endpointEventList.addEndpoint(ev);
  });
  currentMeeting.addEventListener(Events.EndpointUpdated, (ev: any) => {
    console.error('EndpointUpdated', ev);
    endpointEventList.updateEndpoint(ev);
  });
  currentMeeting.addEventListener(Events.EndpointRemoved, ({ endpointId }) => {
    console.error('EndpointRemoved', endpointId);
    endpointEventList.removeEndpoint(endpointId);
    clearReaction(endpointId); // убираем из store реакции этого пользователя для других
  });
  currentMeeting.addEventListener(Events.MessageReceived, ({ message }) => {
    if (message.includes('vi/upgrade')) {
      const { url, rand } = JSON.parse(message);

      ConferenceSignaling.init(url, rand);
    }
  });
  await currentMeeting.start();

  setTimeout(() => {
    currentMeeting.sendMessage('vi/upgrade');
  }, 2000);

  endpointEventList.addEndpoint({
    endpointId: 'local',
    userName: authStore.getState().username || 'local',
    displayName: authStore.getState().displayName || 'Local',
    mids,
    tracks,
  });
  return currentMeeting;
});

const restoreMeeting = createEffect<string, MeetingDescription, void>(async (meetingId) => {
  const response = await fetch(`${appConfig.baseServerUrl}uuids/get-short-uuid-info`, {
    method: 'POST',
    headers: {
      ...makeAuthHeaders(),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uuid: meetingId }),
  });
  const json = await response.json();

  if (!json.data) {
    return {
      meetingId,
      voxMeetingId: '',
      owner: '',
    };
  }

  await joinChat(json.data.uuid);
  return {
    meetingId,
    voxMeetingId: json.data.uuid,
    owner: json.data.is_owner,
  };
});

const meetingStore = createStore<MeetingDescription>({});
const userStatusStore = createStore<UserStatus>({ status: statusType.none }).on(
  changeUserStatus,
  (state, status) => {
    state.status = status;
    return { ...state };
  }
);
meetingStore.on(createMeeting.doneData, (_, payload) => payload);
meetingStore.on(startMeeting.doneData, (payload, meeting) => {
  payload.meeting = meeting;
  return payload;
});
meetingStore.on(restoreMeeting.doneData, (_, payload) => payload);
meetingStore.on(restoreMeeting.failData, (_, payload) => {
  console.warn('error', payload);
});

// TODO @irgalamarr
//    fetch(`https://demos05.voximplant.com/cdn/comp?id=av1_${+ new Date()}&ua=${navigator.userAgent}&codec=${JSON.stringify(codecs)}`)
//       .then(response => response.json())
//       .then(data => {
//         document.getElementById('send_res').style.borderColor = "green";
//         console.log(data)
//       });

export {
  createMeeting,
  meetingStore,
  restoreMeeting,
  startMeeting,
  userStatusStore,
  statusType,
  changeUserStatus,
};
