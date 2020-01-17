import ModelFactory from '../models';
import uuid from 'uuid/v4';

jest.mock('uuid/v4');

describe('MessageFragment', () => {

  const testUUID = '0af9f62f-0e6b-4378-8cfc-dcb4f9e3ec54';

  const MessageFragment = ModelFactory.getByName('MessageFragment');

  const uuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  const messageIdPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

  beforeEach(() => {
    uuid.mockImplementation(() => testUUID);
  });

  afterAll(() => {
    jest.clearAllMocks();
    ModelFactory.sequelize.close();
  });

  it('should return id as a valid uuid', () => {
    return MessageFragment.findAll({}).then(value => {
      return expect(value[0].dataValues.id).toMatch(uuidPattern);
    });
  });

  it('should return a valid message_id', () => {
    return MessageFragment.findAll({}).then(value => {
      return expect(value[0].dataValues.message_id).toMatch(messageIdPattern);
    });
  });

  it('should return null object for completed_at', () => {
    return MessageFragment.findAll({}).then(value => {
      return expect(value[0].dataValues.completed_at).toBeNull();
    });
  });

  it('should return Date object for created_at', () => {
    return MessageFragment.findAll({}).then(value => {
      return expect(typeof value[0].dataValues.created_at).toBe(typeof new Date());
    });
  });

  it('should return Date object for updated_at', () => {
    return MessageFragment.findAll({}).then(value => {
      return expect(typeof value[0].dataValues.updated_at).toBe(typeof new Date());
    });
  });

  it('should return null for deleted_at', () => {
    return MessageFragment.findAll({}).then(value => {
      return expect(value[0].dataValues.deleted_at).toBe(null);
    });
  });

  it('should return 1 for items deleted and deleted_at should have been updated', () => {
    const destroyOptions = {
      where: {
        id: 'a1ff815c-6452-4020-ab13-9200d27a06ed'
      }
    };

    return MessageFragment.destroy(destroyOptions)
      .then(value => {
        expect(value).toBe(1);
        return MessageFragment.findOne({ ...destroyOptions, paranoid: false }).then(value => {
          return expect(typeof value.dataValues.deleted_at).toBe(typeof new Date());
        });
      })
      .finally(() => {
        return MessageFragment.restore({ ...destroyOptions, paranoid: false });
      });
  });

  it('should return 1 for items restored and deleted_at should have been removed', () => {
    const restoreOptions = {
      where: {
        id: 'c47134d3-6ef7-4852-8e86-a5fd1a3c81ce'
      }
    };

    return MessageFragment.restore({ ...restoreOptions, paranoid: false })
      .then(value => {
        expect(value).toBe(1);
        return MessageFragment.findOne(restoreOptions).then(value => {
          return expect(typeof value.dataValues.deleted_at).toBe(typeof new Date());
        });
      })
      .finally(() => {
        return MessageFragment.destroy(restoreOptions);
      });
  });

  it('should not return anything if record has been destroyed (soft)', () => {
    const destroyedOptions = {
      where: {
        id: 'c47134d3-6ef7-4852-8e86-a5fd1a3c81ce'
      }
    };

    return MessageFragment.findOne(destroyedOptions).then(value => {
      return expect(value).toBeNull();
    });
  });

  it('should create new entry using model', () => {

    const new_entry_params = {
      message_id: uuid()
    };

    return MessageFragment.create(new_entry_params)
      .then(value => {
        expect(value.dataValues.created_at).not.toBeNull();
        expect(value.dataValues.updated_at).not.toBeNull();
        expect(value.dataValues.deleted_at).toBeNull();
        expect(value.dataValues.completed_at).toBeNull();
        expect(value.dataValues.message_id).toMatch(new_entry_params.message_id);
        expect(value.dataValues.id).toMatch(testUUID);
      })
      .finally(() => {
        // force = true -> Hard Delete
        return MessageFragment.destroy({
          where: { id: testUUID },
          paranoid: false,
          force: true
        }).then(value => {
          return expect(value).toBe(1);
        });
      });
  });

  it('should update the updated_at with a record update', () => {
    const updateOptions = {
      where: {
        id: '74c6230b-36d9-4940-bdd6-495ba87ed634'
      }
    };

    return MessageFragment.update(
      {
        message_id: uuid()
      },
      updateOptions
    ).then(value => {
      expect(value[0]).toBe(1);

      return MessageFragment.findOne(updateOptions).then(value => {
        return expect(value.dataValues.updated_at.toISOString()).not.toBe(
          value.dataValues.created_at.toISOString()
        );
      });
    });
  });

  it('should update the completed_at with Date when complete is called', () => {
    const completeOptions = {
      where: {
        id: '74c6230b-36d9-4940-bdd6-495ba87ed634'
      }
    };

    return MessageFragment.complete(completeOptions)
      .then(value => {
        return expect(value).toContain(1);
      })
      .finally(() => {
        return MessageFragment.findOne(completeOptions).then(value => {
          return expect(value.dataValues.completed_at).not.toBeNull();
        });
      });
  });
});