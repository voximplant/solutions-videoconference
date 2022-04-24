import { createEvent, createStore } from 'effector';

interface InvitePeopleModal {
  title: string;
  number: string;
  activeCountry: Record<string, unknown>;
  countries: Record<string, unknown>[];
}

interface SettingsModal {
  initTab?: string;
}

interface ModalStoreInterface {
  opened: boolean;
  component?: string;
  componentOptions?: InvitePeopleModal | SettingsModal;
}

const openModal = createEvent<ModalStoreInterface>();
const closeModal = createEvent<void>();

const isModalOpened = createStore<ModalStoreInterface>({ opened: false, component: '' })
  .on(openModal, (state, content) => content)
  .on(closeModal, (state) => {
    return { ...state, opened: false };
  });

export { isModalOpened, openModal, closeModal };
