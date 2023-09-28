import React from 'react';
import NimikeEditor from './SivuEditor-components/NimikeEditor'; // Import your NimikeEditor component
import OtsikkoEditor from './SivuEditor-components/OtsikkoEditor'

const SivuEditor = () => {
  return (
    <div>
      <h1>Sivu Editor</h1>
      <NimikeEditor />
      <OtsikkoEditor/>
    </div>
  );
};

export default SivuEditor;
