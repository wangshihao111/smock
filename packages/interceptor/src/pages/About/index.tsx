import React, { FC, useEffect } from 'react'

const About: FC = () => {
  useEffect(() => {
    console.log(`object`)
  }, [])
  return (
    <div>
      about
    </div>
  )
}

export default About
