import { resolve, reject } from "q"
import axios from 'axios'
import Fuse from 'fuse.js'
import { getCardNameFromJSON } from './utils'

export var ip = "http://190.44.74.23:8001"