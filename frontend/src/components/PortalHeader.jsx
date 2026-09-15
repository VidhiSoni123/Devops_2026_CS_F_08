function PortalHeader({ title, description }) {
  return (
    <div className="portal-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

export default PortalHeader