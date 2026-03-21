"use client"

import * as React from "react"

type Dir = "ltr" | "rtl"

const DirectionContext = React.createContext<{ dir: Dir }>({ dir: "ltr" })

function DirectionProvider({
  dir,
  direction,
  children,
}: {
  dir?: Dir
  direction?: Dir
  children: React.ReactNode
}) {
  const value = { dir: direction ?? dir ?? "ltr" }
  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>
}

const useDirection = () => React.useContext(DirectionContext).dir

export { DirectionProvider, useDirection }
