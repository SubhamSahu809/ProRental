export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center" role="status">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-4 text-gray-600">{label}</p>
    </div>
  );
}
