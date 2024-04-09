import React from 'react';

function Image({ src, alt }) {
  return <img src={src} alt={alt} style={{ width: '100%', height: 'auto' }} />;
}

export default Image;
