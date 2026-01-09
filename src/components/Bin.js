import React, { useState } from 'react';

const Bin = ({ type, label, onDropCorrect }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    
    const draggedType = e.dataTransfer.getData("itemType");
    
    onDropCorrect(draggedType === type);
  };

  return (
    <div 
      className={`bin ${type} ${isOver ? 'bin-active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      <div className="bin-lid"></div>
      <span className="bin-label">{label}</span>
    </div>
  );
};

export default Bin;