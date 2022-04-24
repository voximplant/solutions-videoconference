import { createEvent, createStore } from 'effector';

const togglePopup = createEvent<boolean>();
const toggleInvitePopup = createEvent<boolean>();

const isPopupOpened = createStore<boolean>(false).on(togglePopup, (state, content) => content);
const isInvitePopupOpened = createStore<boolean>(false).on(
  toggleInvitePopup,
  (state, content) => content
);

export { isPopupOpened, isInvitePopupOpened, togglePopup, toggleInvitePopup };
