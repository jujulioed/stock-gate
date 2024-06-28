import React from 'react';
import './index.css';

function SubmitButton({ onSubmit }) {
  const handleClick = () => {
    const userConfirmed = window.confirm("Você realmente deseja submeter as informações?");
    if (userConfirmed) {
      onSubmit();
    }
  };

  return (
    <button className="submit-button" onClick={handleClick}>
      Enviar
    </button>
  );
}

export default SubmitButton;
