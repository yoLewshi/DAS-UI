import {replaceInFileSync} from 'replace-in-file'

const options = {
  files: 'dist/assets/*.css',
  from: /:global((.*?)){/g,
  to: (match) => {
    return match.replaceAll(":global(", "",).replaceAll(")", "")
  },
}

try {
  const results = replaceInFileSync(options)
  console.log('Replacement results:', results)
}
catch (error) {
  console.error('Error occurred:', error)
}