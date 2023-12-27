import React from 'react';

export const SmartVideo: React.FunctionComponent<{ src: string }> = ({
  src,
}) => (
  <video
    autoPlay
    preload="none"
    onLoadedMetadata={({ currentTarget: video }) => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
    }}
    width="800"
    height="450"
    src={src}
    style={{ border: '1px solid #e2e2e2' }}
    controls
  />
);
