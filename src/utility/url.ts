import path from 'path'
import { fileURLToPath } from 'url'

const metaUrl = fileURLToPath(path.join(import.meta.url, '../../../../'))

export default metaUrl
