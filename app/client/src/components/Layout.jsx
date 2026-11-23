import { Outlet } from 'react-router-dom';
// Each original page owns its layout. The PHP site never had a shared navigation shell.
export default function Layout() { return <Outlet/>; }
