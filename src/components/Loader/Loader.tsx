import './Loader.css';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black opacity-70 flex items-center justify-center z-[9999]">
      <div className="sk-fading-circle">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`sk-circle${i + 1} sk-circle`}></div>
        ))}
      </div>
    </div>
  );
};

export default Loader;
