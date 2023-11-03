
"use client"
import { useEffect, useState } from "react"

export function useDataAsync(url: string) {
    const [data, setData] = useState();
    useEffect(() => {
      let ignore = false;
  
      async function fetchData(url: string) {
        const response = await fetch(url)
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json()
        
        if(!ignore) {
          setData(data)
        }
      } 
     
      fetchData(url);
  
        return () => {
          ignore = true;
        }
      }, [url])
      
      return data;
  }


export function useData(url: string) {
  const [data, setData] = useState();
  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if(!ignore) {
          setData(data);
        }
      });

      return () => {
        ignore = true;
      }
  }, [url])

  return data;
}
