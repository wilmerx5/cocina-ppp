import { Link } from "react-router-dom";

const ErrorFetchingData = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="bg-white border border-red-400 shadow-lg rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
        <h2 className="text-lg font-bold text-red-600">Error trayendo datos</h2>
        <p className="text-sm text-gray-700">Ocurrió un problema al cargar la información.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm"
        >
          Recargar página
        </button>

        <p><Link to={'/'} >Volver a inicio</Link></p>
      </div>
    </div>
  );
};

export default ErrorFetchingData;
