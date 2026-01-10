export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-4 flex justify-between gap-4">
      <div>
        <h3 className="font-bold text-lg">{task.title}</h3>
        <p className="text-sm text-gray-600">{task.description}</p>

        <span
          className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
            task.status === "completed"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {task.status}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onEdit(task)}
          className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:opacity-90"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task._id)}
          className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:opacity-90"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
