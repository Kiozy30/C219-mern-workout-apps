import { useEffect }from 'react'
import { useWorkoutsContext } from "../hooks/useWorkoutsContext"
import { useAuthContext } from "../hooks/useAuthContext"

// components
import WorkoutDetails from '../components/WorkoutDetails'
import WorkoutForm from '../components/WorkoutForm'

const Home = () => {
  const {workouts, dispatch} = useWorkoutsContext()
  const {user} = useAuthContext()

  useEffect(() => {
    const fetchWorkouts = async () => {
        const response = await fetch('/api/workouts', {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
      
        console.log("Response status:", response.status);  // Log the status code
        const json = await response.json().catch((err) => console.log("Error parsing JSON:", err));
      
        if (response.ok) {
          dispatch({ type: 'SET_WORKOUTS', payload: json });
        } else {
          console.log("Error fetching workouts:", json);
        }
      }
      

    if (user) {
      fetchWorkouts()
    }
  }, [dispatch, user])

  return (
    <div className="home">
      <div className="workouts">
        {workouts && workouts.map((workout) => (
          <WorkoutDetails key={workout._id} workout={workout} />
        ))}
      </div>
      <WorkoutForm />
    </div>
  )
}

export default Home