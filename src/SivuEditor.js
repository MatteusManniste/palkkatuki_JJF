import React from 'react';
import NimikeEditor from './SivuEditor-components/NimikeEditor';
import OtsikkoEditor from './SivuEditor-components/OtsikkoEditor';

const SivuEditor = () => {
  return (
    <div className="sivu-content">
      <NimikeEditor />
      <OtsikkoEditor />
    </div>
  );
};

export default SivuEditor;
