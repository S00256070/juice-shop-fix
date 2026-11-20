/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import challengeUtils = require('../lib/challengeUtils')

import * as utils from '../lib/utils'
import { challenges } from '../data/datacache'
const security = require('../lib/insecurity')

module.exports = function retrieveBasket() {
  return (req: Request, res: Response, next: NextFunction) => {
    // constants
    const id = req.params.id
    const user = security.authenticatedUsers.from(req)
    // check if user is authenticated
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // check if user is authorized to access the basket
    BasketModel.findOne({
      where: {
        id: req.params.id,
        UserId: user.data.id
      },
      include: [{
        model: ProductModel,
        paranoid: false,
        as: 'Products'
      }]
    })
    // check if basket exists and return it
      .then((basket: BasketModel | null) => {
        if (basket == null) {
          return res.status(404).json({ error: 'Basket not found' })
        }
        res.json(utils.queryResultToJson(basket))
    // error handling
      }).catch((error: Error) => {
        next(error)
      })
  }
}
