import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";
import "./Layout.css";
export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-right">
        <Topbar />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}