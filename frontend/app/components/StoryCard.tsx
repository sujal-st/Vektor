import React from 'react'

type StoryCardProps={
  id: number;
  year: string;
  icon: string;
  cl: string;
  caption:string;
}
function storyCard(props:StoryCardProps) {
  return (
    
      <div className="storycard  flex flex-col text-[#ECE2CD]">
        <div className='font-bold text-[2rem]'>{props.year}</div>
        <div className={`${props.cl}`}></div>
        <div className='story-caption'>{props.caption}</div>
      </div>
  )
}

export default storyCard
