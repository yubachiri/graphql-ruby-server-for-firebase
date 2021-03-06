import { useCurrentUser } from '@/react/hooks/currentUser'
import React from 'react'
import { Link } from 'react-router-dom'

type Props = {}

// type State = {}

export const Menu: React.FC<Props> = ({ children }) => {
  const { user, logout } = useCurrentUser()

  return (
    <>
      {user && (
        <ul className="flex items-center justify-end p-6 bg-teal-500">
          <li className="mr-6">
            <Link to="/">
              Logo
            </Link>
          </li>
          <li>
            <button onClick={logout}>
              Sign out
            </button>
          </li>
        </ul>
      )}
      {!user && (
        <ul className="flex items-center justify-end p-6 bg-teal-500">
          <li className="mr-6">
            <Link to="/sign_in">Sign in</Link>
          </li>
          <li>
            <Link to="/sign_up">Sign up</Link>
          </li>
        </ul>
      )}
      {children}
      {!user && <div>Please sign in</div>}
    </>
  )
}
