import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { StoreProvider, useStore } from './lib/store'
import { CoursesPage } from './pages/Courses'
import { DashboardPage } from './pages/Dashboard'
import { LoginPage } from './pages/Login'
import { OfferingsPage } from './pages/Offerings'
import { OrganizationPage } from './pages/Organization'
import { ProfilePage } from './pages/Profile'
import { ReportsPage } from './pages/Reports'
import { SchedulePage } from './pages/Schedule'
import { SelectCoursesPage } from './pages/SelectCourses'
import { StudentsPage } from './pages/Students'
import { TeachersPage } from './pages/Teachers'
import { TermsPage } from './pages/Terms'
import type { Role } from './types'

function Guard({ roles }: { roles?: Role[] }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Guard />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route element={<Guard roles={['admin']} />}>
                <Route path="organization" element={<OrganizationPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="teachers" element={<TeachersPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>
              <Route element={<Guard roles={['admin', 'teacher']} />}>
                <Route path="offerings" element={<OfferingsPage />} />
              </Route>
              <Route element={<Guard roles={['student']} />}>
                <Route path="select" element={<SelectCoursesPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              <Route path="schedule" element={<SchedulePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
