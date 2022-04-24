import { createEvent, createStore } from 'effector';

type DrawerSection = 'chat' | 'settings' | 'generalSettings' | 'changeLayout' | 'contactList';

interface DrawerStore {
  opened: boolean;
  section: DrawerSection;
}

const $drawer = createStore<DrawerStore>({ opened: false, section: 'chat' });

const openDrawer = createEvent<DrawerSection | undefined>();
const closeDrawer = createEvent<void>();
const toggleDrawer = createEvent<DrawerSection | undefined>();

openDrawer.watch((value) => {
  console.warn('openDrawer', value);
});

$drawer
  .on(openDrawer, (state, section) => ({ opened: true, section: section || state.section }))
  .on(closeDrawer, (state) => ({ ...state, opened: false }))
  .on(toggleDrawer, (state, section) => {
    if (!state.opened) {
      return { opened: true, section: section || state.section };
    }
    return { opened: false, section: state.section };
  });

export { DrawerSection, DrawerStore, $drawer, openDrawer, closeDrawer, toggleDrawer };
