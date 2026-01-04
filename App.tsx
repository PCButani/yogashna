import RootNavigator from "./src/navigation/RootNavigator";
import "./src/config/firebase"; // Initialize Firebase when app starts

export default function App() {
  return <RootNavigator />;
}