import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {generatePassWord, comparePassWord, generateToken} from '../utils/user'
import {authenticate} from '@loopback/authentication';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
  ) {}

  @post('/users/register', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {
          "type": "object",
          "properties": {
            "email": {
              "description": "Email",
              "type": "string"
            },
            "password": {
              "description": "Password",
              "type": "string"
            },
            "name": {
              "description": "Name",
              "type": "string"
            }
          }
        }
        }
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          "schema": {
            "type": "object",
            "properties": {
              "email": {
                "description": "Email",
                "type": "string"
              },
              "password": {
                "description": "Password",
                "type": "string"
              },
              "name": {
                "description": "Name",
                "type": "string"
              }
            },
            "required": ["email", "password", "name"]
          },
        },
      },
    })
    body: User,
  ): Promise<Object> {
    const checkEixstsEmail = await this.userRepository.findOne({where: {email: body.email}})
    if (checkEixstsEmail) {
      return {
        status: 400,
        message: `Đã tồn tại user với email: ${body.email}`,
        data: {}
      };
    }
    body.password = await generatePassWord(body.password)
    const response = await this.userRepository.create(body);
    return {
      status: 200,
      message: `Thành công`,
      data: response
    };
  }


  @post('/users/login', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {
              "type": "object",
              "properties": {
                "email": {
                  "description": "Email",
                  "type": "string"
                },
                "password": {
                  "description": "Password",
                  "type": "string"
                }
              }
            }
          }
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          "schema": {
            "type": "object",
            "properties": {
              "email": {
                "description": "Email",
                "type": "string"
              },
              "password": {
                "description": "Password",
                "type": "string"
              }
            },
            "required": ["email", "password"]
          },
        },
      },
    })
      body: User,
  ): Promise<Object> {
    const checkEixstsEmail = await this.userRepository.findOne({where: {email: body.email}})
    if (!checkEixstsEmail) {
      return {
        status: 404,
        message: `Không tồn tại user với email: ${body.email}`,
        data: {}
      };
    }
    const compare = await comparePassWord(body.password, checkEixstsEmail.password)
    if(compare) {
      const user  = {name: checkEixstsEmail.id, email: checkEixstsEmail.email, fullName: checkEixstsEmail.name, token: ''}
      const token = generateToken(user)
      user.token = token
      return {
        status: 200,
        message: `Thành công`,
        data: user
      };
    }
    return {
      status: 200,
      message: `Sai mật khẩu`,
      data: {}
    };
  }

  @authenticate('jwt')
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter<User>
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  //
  // @get('/users/count', {
  //   responses: {
  //     '200': {
  //       description: 'User model count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async count(
  //   @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.count(where);
  // }
  //
  // @get('/users', {
  //   responses: {
  //     '200': {
  //       description: 'Array of User model instances',
  //       content: {
  //         'application/json': {
  //           schema: {
  //             type: 'array',
  //             items: getModelSchemaRef(User, {includeRelations: true}),
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter<User>,
  // ): Promise<User[]> {
  //   return this.userRepository.find(filter);
  // }
  //
  // @patch('/users', {
  //   responses: {
  //     '200': {
  //       description: 'User PATCH success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  //   @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.updateAll(user, where);
  // }
  //
  // @get('/users/{id}', {
  //   responses: {
  //     '200': {
  //       description: 'User model instance',
  //       content: {
  //         'application/json': {
  //           schema: getModelSchemaRef(User, {includeRelations: true}),
  //         },
  //       },
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.number('id') id: number,
  //   @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter<User>
  // ): Promise<User> {
  //   return this.userRepository.findById(id, filter);
  // }
  //
  // @patch('/users/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'User PATCH success',
  //     },
  //   },
  // })
  // async updateById(
  //   @param.path.number('id') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  // ): Promise<void> {
  //   await this.userRepository.updateById(id, user);
  // }
  //
  // @put('/users/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'User PUT success',
  //     },
  //   },
  // })
  // async replaceById(
  //   @param.path.number('id') id: number,
  //   @requestBody() user: User,
  // ): Promise<void> {
  //   await this.userRepository.replaceById(id, user);
  // }
  //
  // @del('/users/{id}', {
  //   responses: {
  //     '204': {
  //       description: 'User DELETE success',
  //     },
  //   },
  // })
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.userRepository.deleteById(id);
  // }
}
