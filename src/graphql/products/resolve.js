import mongoose from 'mongoose'

import { Product, Pattern } from '../../models'

export const Query = {

   async product(_, { where }) {
      return await Product
         .findOne(where)
         .lean()
   },

   async products(_, { where, sort, skip, limit }) {
      let categories = where
         .categories
         .map(category => new mongoose.Types.ObjectId(category))
      return await Product.find({
            ...where,
            name: new RegExp(where.name, 'i'),
            categories: {
               $eq: categories
            }
         })
         .sort(sort)
         .skip(skip)
         .limit(limit)
         .lean()
   }
}

export const Mutation = {
   async addNewProduct(_, { product }) {
      let productMongoID = mongoose
         .Types
         .ObjectId()
      let patterns = product
         .patterns
         .map(pattern => {
            return {
               ...pattern,
               product: productMongoID
            }
         })
      let patterns = await Pattern.insertMany(patterns)
      let newProduct = await Product.create({
         ...product,
         _id: productMongoID,
         categories: product.categories ?
            product
            .categories
            .map(category => mongoose.Types.ObjectId(category)) : [],
         patterns,
         importPrice: product.importPrice || 0,
         exportPrice: product.exportPrice || 0,
         quantity: product.quantity || 0
      })
      return newProduct
   },

   async updateProduct(_, { product }) {
      let categories = product
         .categories
         .map(category => new mongoose.Types.ObjectId(category))
      return await Product.findByIdAndUpdate(product._id, {
         $set: {
            ...product,
            categories
         }
      }, { new: true }).lean()
   }
}

export const Enum = {
   ProductSortCases: {
      name_ASC: ['name'],
      name_DESC: [
         'name', -1
      ],
      importDate_ASC: ['importDate'],
      importDate_DESC: [
         'importDate', -1
      ],
      importPrice_ASC: ['importPrice'],
      importPrice_DESC: [
         'importPrice', -1
      ],
      exportPrice_ASC: ['exportPrice'],
      exportPrice_DESC: ['exportPrice', -1]
   }
}