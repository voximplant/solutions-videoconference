import { TilerWorker, VoxTilerInput, VoxTilerOptions } from '@voximplant/tiler';
import { RawOutput } from '@/store/webrtc/endpoints';
import { CanvasDef, Layout } from '@/helpers/layouts';
import { RenderVideoStore } from '@/store/endpointMedia/RenderVideoStore';

export const composeVideo = (
  canvas: CanvasDef,
  videoBankMedia: RawOutput[],
  layout: Layout
): RenderVideoStore[] => {
  const currentVideoInput: VoxTilerInput[] = [];

  videoBankMedia.forEach((element: RawOutput) => {
    const id = element.stream.id;
    const objectFit = element.stream.objectFit || 'cover';
    const area = element.stream.area;
    const video = element.stream.mid.video;
    const canPlay = element.stream.canPlay;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const kind = element.stream.mid.video?.kind || element.stream?.kind || '';
    const title = {
      label: (element.stream.title && element.stream.title.label) || 'test',
      padding: 2,
      margin: 8,
      position: 'bottom right',
    };
    const muted = element.stream.muted;
    currentVideoInput.push(({
      id,
      objectFit,
      kind,
      title,
      area,
      video,
      muted,
      canPlay,
    } as unknown) as VoxTilerInput);
  });

  const areas = layout.createTilerDrawAreas();

  const voxTilerOptions: VoxTilerOptions = {
    ...canvas,
    outputFormat: 'web',
    areas,
  };

  const tilerClass = new TilerWorker(voxTilerOptions);
  return tilerClass.compose(currentVideoInput) as RenderVideoStore[];
};
