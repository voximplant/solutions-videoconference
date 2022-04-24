<template lang="pug">
.sign-in
  SettingsInDefault(v-if="authS.authState === 1" :deviceError="requestResult")
  WrongConferenceIDPopUp(v-if="isWrongConferenceID")
</template>

<script lang="ts">
  import Logo from '@/components/Logo.vue';
  import { defineComponent, ref, watch } from 'vue';
  import SettingsInDefault from '@/components/layout-settings/SettingsInDefault.vue';
  import { useStore } from 'effector-vue/composition';
  import { AuthState, authStore, restoreAuth } from '@/store/auth.ts';
  import { useRouter } from 'vue-router';
  import { meetingStore, restoreMeeting } from '@/store/meeting';
  import {
    getDevices,
    toggleAudioEvent,
    toggleVideoDisabled,
    toggleVideoEvent,
  } from '@/store/devices';
  import { requestMirrorStream } from '@/store/mirrorMedia/index';
  import '@/store/mirrorMedia/init';
  import '@/store/devices/init';
  import WrongConferenceIDPopUp from '@/components/popups/WrongConferenceIDPopUp.vue';
  import { togglePopup } from '@/store/popup';
  import '@/store/chat/init';

  export default defineComponent({
    name: 'Join',
    components: {
      WrongConferenceIDPopUp,
      Logo,
      SettingsInDefault,
    },
    props: {
      conference: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const authS = useStore(authStore);
      const meeting = useStore(meetingStore);
      const router = useRouter();
      console.error('authS.value.authState', authS.value.authState);
      sessionStorage.removeItem('backLink');
      const isWrongConferenceID = ref(false);
      let requestResult = ref<string | void>('');
      const openPopup = () => togglePopup(true);

      watch(meeting, () => {
        if ('voxMeetingId' in meeting.value && !meeting.value.voxMeetingId) {
          isWrongConferenceID.value = true;
        }
      });

      async function mirrorStreamCatchHandler(e: Error): Promise<string> {
        let errorType;
        console.error('Get device error', e.message);
        errorType = 'noCamera'; // if camera stream getting error because get AbortError или OverConstrainError
        await getDevices();
        toggleVideoEvent();
        toggleVideoDisabled();

        await requestMirrorStream({}).catch((e) => {
          toggleAudioEvent();
          switch (e.message) {
            case 'NotAllowedError':
              openPopup();
              return (errorType = 'browserPermission');
            case 'AbortError':
              return (errorType = 'AbortError');
            default:
              return (errorType = 'otherError');
          }
        });
        return errorType;
      }

      if (authS.value.authState !== AuthState.OAuth) {
        restoreAuth()
          .then(async (data) => {
            if (data.status === 401) {
              sessionStorage.setItem('backLink', props.conference);
              router.replace({
                name: 'Signin',
              });
              return;
            } else {
              if (!meeting.value.voxMeetingId) {
                restoreMeeting(props.conference);
              }

              requestResult.value = await requestMirrorStream({})
                .then(() => {
                  console.error('Join getDevices');
                  getDevices();
                })
                .catch(async (e) => {
                  return mirrorStreamCatchHandler(e);
                });
            }
          })
          .catch(() => {
            sessionStorage.setItem('backLink', props.conference);
            router.replace({
              name: 'Signin',
            });
          });
      } else {
        if (meeting.value.meeting?.uuid) {
          restoreMeeting(props.conference);
        }
        requestMirrorStream({})
          .then(() => {
            console.error('Join getDevices');
            getDevices();
          })
          .catch(async (e) => {
            requestResult.value = await mirrorStreamCatchHandler(e);
          });
      }
      return {
        authS,
        isWrongConferenceID,
        requestResult,
      };
    },
  });
</script>

<style scoped></style>
