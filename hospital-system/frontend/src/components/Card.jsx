import React from 'react';
import './Card.css';

const Card = ({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  onClick,
  ...props
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    interactive && 'card--interactive',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={interactive ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;