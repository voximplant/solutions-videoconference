<template lang="pug">
.contact-item
  //input(type="checkbox" :id="item" :name="item")
  div(:class="itemClasses")
    .emoji(v-if="type === 'inCall'" :key="lastEmoji" )
      span(:class="emojiClass") {{ lastEmoji }}
    img.avatar(v-if="isContact" :src="image" alt="avatar")
    span.name {{ item }}
  //.btns(v-if="type === 'wait'" )
      Button.dismis(
        mode="flat"
        size="s"
      ) {{ t('buttons.contact.dismiss') }}
      Button.btn(
        mode="primary"
        size="s"
      ) {{ t('buttons.contact.admit') }}
  .btns(v-if="type === 'inCall'" )
    Icon(
      spriteUrl="/image/videoconf-icons.svg"
      :name="iconMicName"
      color="--sui-gray-700"
    )
    Icon(
      spriteUrl="/image/videoconf-icons.svg"
      :name="iconCamName"
      color="--sui-gray-700"
    )
    //  Button(
        //:modelValue="devices.audioEnabled"
        mode="flat"
        //:icon="{ spriteUrl: '/image/videoconf-icons.svg', name: `${iconMicName}`, color: '--sui-gray-700'}"
        icon-only
        size="s"
        @click="toggleAudio"
        )
        Button(
          //:modelValue="devices.videoEnabled"
          mode="flat"
          //:icon="{ spriteUrl: '/image/videoconf-icons.svg', name: `${iconCamName}`, color: '--sui-gray-700'}"
          icon-only
          size="s"
          @click="toggleVideo"
          )
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Button, Icon } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import { useStore } from 'effector-vue/composition.cjs';
  import { useMuteState } from '@/hooks/useMuteState';
  import { $endpoints } from '@/store/webrtc/endpoints';
  import { EndpointDescriptionStore } from '@/store/webrtc/endpointTypes';
  import { reactionsStore, updateReaction } from '@/store/reactions';

  export default defineComponent({
    name: 'ContactItem',
    components: {
      Button,
      Icon,
    },
    props: {
      item: {
        type: String,
      },
      userName: {
        type: String,
        required: true,
      },
      endpointId: {
        type: String,
        required: true,
      },
      image: {
        type: String,
      },
      isContact: {
        type: Boolean,
        default: true,
      },
      type: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const { t } = useI18n();
      const endpoints = useStore($endpoints);
      const itemClasses = computed(() =>
        props.type === 'offline' ? 'item-without-button' : 'item-with-button'
      );
      const emojiClass = computed(() => (userReactions.value?.size ? '' : 'mock'));
      const reactions = useStore(reactionsStore);
      const userReactions = computed(() => reactions.value.reactions[props.userName]);
      const lastEmoji = ref(reactions.value.emojilist['hand']);
      const muted = ref(useMuteState(props.endpointId));
      const userMedia = computed(
        () =>
          endpoints.value.endpoints.find(
            (media: EndpointDescriptionStore) => media.id === props.endpointId
          )?.mid
      );
      const videoEnabled = computed(
        () => userMedia.value && Object.values(userMedia.value).includes('video')
      );
      const iconMicName = computed(() =>
        muted.value ? 'ic25-contact-mic-off' : 'ic25-contact-mic-on'
      );
      const iconCamName = computed(() =>
        videoEnabled.value ? 'ic25-contact-video-on' : 'ic25-contact-video-off'
      );
      userReactions.value?.forEach((emoji) => {
        lastEmoji.value = reactions.value.emojilist[emoji];
      });
      updateReaction.watch((reaction) => {
        if (reaction.userName === props.userName) {
          if (reaction.active) {
            lastEmoji.value = reactions.value.emojilist[reaction.type];
          } else if (!reaction.active && userReactions.value?.size !== 0) {
            userReactions.value?.forEach((emoji) => {
              lastEmoji.value = reactions.value.emojilist[emoji];
            });
          } else {
            lastEmoji.value = reactions.value.emojilist['hand'];
          }
        }
      });

      return {
        t,
        iconMicName,
        iconCamName,
        itemClasses,
        lastEmoji,
        emojiClass,
      };
    },
  });
</script>

<style scoped>
  .contact-item {
    font-family: var(--fontRoboto);
    height: fit-content;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    &:not(:last-child) {
      margin-bottom: 16px;
    }
    & .emoji {
      line-height: 32px;
      min-width: 20px;
      margin-right: var(--pad8);
      & .mock {
        filter: grayscale(100%);
        opacity: 1;
      }
    }
    & .btns {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      column-gap: var(--pad8);
    }
    & .item-with-button {
      display: flex;
      align-items: center;
      font-size: var(--pad16);
      line-height: var(--pad20);
      color: var(--gray900);
      max-width: 80%;
      position: relative;
      & .name {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        padding-right: var(--pad8);
      }
      & .dismis {
        margin-right: 8px;
        &::v-deep(.sui-button-content) {
          color: var(--gray700);
        }
      }
    }
    & .item-without-button {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    & input {
      display: none;
    }
    & input:checked ~ .check-input-wrap {
      color: var(--purple500);
      background-color: var(--gray100);
      &::after {
        position: absolute;
        content: '';
        width: var(--pad24);
        height: var(--pad24);
        background: url('../../assets/images/icon/check.svg');
        right: var(--pad16);
        top: var(--pad16);
      }
    }
    & .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 12px;
    }
  }
</style>
