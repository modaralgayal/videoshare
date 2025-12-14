import jobs from "../mockData/jobs.json";

export const Jobs = () => {
  return (
    <div>
      <h2>Jobs Postings</h2>

      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <b>{job.title}</b>
            <p>{job.description}</p>
            <p>
              Budget: ${job.budget_min} – ${job.budget_max}
            </p>
            <small>Status: {job.status}</small> <button> Make a bid </button> <button> Send a Message </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
