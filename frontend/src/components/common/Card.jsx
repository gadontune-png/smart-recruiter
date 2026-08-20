import "./common.css";

function Card({ children, padded = false, className = "", as: Tag = "div", ...rest }) {
  const classes = `card ${padded ? "card-padded" : ""} ${className}`.trim();
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

Card.Header = function CardHeader({ children, className = "" }) {
  return <div className={`card-header ${className}`.trim()}>{children}</div>;
};

Card.Body = function CardBody({ children, className = "" }) {
  return <div className={`card-body ${className}`.trim()}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = "" }) {
  return <div className={`card-footer ${className}`.trim()}>{children}</div>;
};

export default Card;